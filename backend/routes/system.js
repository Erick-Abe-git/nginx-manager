import { Router } from 'express';
import si from 'systeminformation';

const router = Router();

router.get('/stats', async (req, res) => {
  try {
    const [cpu, mem, disk, network] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats()
    ]);

    res.json({
      cpu: {
        usage: cpu.currentLoad,
        cores: cpu.cpus.length
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free
      },
      disk: disk.map(d => ({
        fs: d.fs,
        size: d.size,
        used: d.used,
        available: d.available
      })),
      network: network.map(n => ({
        interface: n.iface,
        rx_sec: n.rx_sec,
        tx_sec: n.tx_sec
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 